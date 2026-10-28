using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: System.Reflection.AssemblyTitle("HWNiX Print Bridge")]
[assembly: System.Reflection.AssemblyProduct("HWNiX Print Bridge")]
[assembly: System.Reflection.AssemblyVersion("1.1.4.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.1.4.0")]

static class Program {
    public static readonly string DataDirectory = Environment.GetEnvironmentVariable("HWNIX_PRINT_DATA_DIR") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "HWNiXPrintBridge");
    public static readonly string UrlFile = Path.Combine(DataDirectory, "admin.url");
    public static readonly string LogFile = Path.Combine(DataDirectory, "launcher.log");
    public static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
    [STAThread]
    static int Main(string[] args) {
        Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
        try {
            if (Array.IndexOf(args, "--stop") >= 0) return StopRunning();
            Directory.CreateDirectory(DataDirectory);
            string mutexName;
            using (var sha = SHA256.Create()) mutexName = "Local\\HWNiXPrintBridge-" + BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(DataDirectory.ToUpperInvariant()))).Replace("-", "").Substring(0, 20);
            bool first;
            using (var mutex = new Mutex(true, mutexName, out first)) {
                if (!first) { if (Array.IndexOf(args, "--background") < 0) QueueActivation(args); return 0; }
                Application.Run(new BridgeContext(Array.IndexOf(args, "--background") >= 0, SelectedFiles(args)));
                mutex.ReleaseMutex();
            }
            return 0;
        } catch (Exception error) { MessageBox.Show("تعذر تشغيل أداة الطباعة.\n" + error.Message, "HWNiX", MessageBoxButtons.OK, MessageBoxIcon.Error); return 1; }
    }
    public static string[] SelectedFiles(string[] args) {
        int index = Array.IndexOf(args, "--file"); if (index < 0) index = Array.IndexOf(args, "--files");
        if (index < 0) return new string[0];
        var files = new System.Collections.Generic.List<string>();
        for (int i = index + 1; i < args.Length && files.Count < 10; i++) if (File.Exists(args[i])) files.Add(Path.GetFullPath(args[i]));
        return files.ToArray();
    }
    static void QueueActivation(string[] args) {
        var path = Path.Combine(DataDirectory, "activation-" + Guid.NewGuid().ToString("N") + ".json");
        File.WriteAllText(path, Json.Serialize(new Activation { paths = SelectedFiles(args) }), Encoding.UTF8);
    }
    public static Uri SettingsUri() {
        var uri = new Uri(File.ReadAllText(UrlFile).Trim());
        if (uri.Scheme != "http" || uri.Host != "127.0.0.1" || !System.Text.RegularExpressions.Regex.IsMatch(uri.Fragment, "^#key=[a-f0-9]{64}$")) throw new Exception("عنوان الخدمة المحلية غير صالح. أعد تشغيل الأداة.");
        return uri;
    }
    public static string AdminPost(string endpoint, object data) {
        var uri = SettingsUri();
        using (var client = new WebClient()) {
            client.Encoding = Encoding.UTF8; client.Headers["Content-Type"] = "application/json";
            client.Headers["X-Admin-Token"] = uri.Fragment.Substring(5); client.Headers["Origin"] = uri.GetLeftPart(UriPartial.Authority);
            return client.UploadString(uri.GetLeftPart(UriPartial.Authority) + "/admin/" + endpoint, Json.Serialize(data));
        }
    }
    public static int StopRunning() {
        if (!File.Exists(UrlFile)) return 0;
        try { AdminPost("shutdown", new object()); Thread.Sleep(400); return 0; }
        catch (WebException error) { return error.Status == WebExceptionStatus.ConnectFailure ? 0 : 2; }
        catch { return 1; }
    }
}
public sealed class Activation { public string[] paths { get; set; } }
public sealed class WindowRequest { public string target { get; set; } public string nonce { get; set; } }

sealed class PrintWindow : Form {
    readonly WebView2 view = new WebView2();
    readonly Uri initial;
    string pendingTarget;
    bool activating;
    bool initialized;
    public bool AllowClose;
    public PrintWindow(Uri uri) {
        initial = uri; Text = "HWNiX — الملفات والملصقات"; Size = new Size(1280, 900); MinimumSize = new Size(980, 700);
        StartPosition = FormStartPosition.CenterScreen; AutoScaleMode = AutoScaleMode.Dpi;
        view.Dock = DockStyle.Fill; Controls.Add(view);
        FormClosing += delegate(object sender, FormClosingEventArgs e) { if (!AllowClose) { e.Cancel = true; Hide(); } };
        Shown += InitializeView;
    }
    async void InitializeView(object sender, EventArgs args) {
        if (initialized) return;
        try {
            var browserArgs = ""; int port;
            if (Int32.TryParse(Environment.GetEnvironmentVariable("HWNIX_PRINT_TEST_DEBUG_PORT"), out port) && port >= 1024 && port < 65536) browserArgs = "--remote-debugging-port=" + port;
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Program.DataDirectory, "webview-profile"), new CoreWebView2EnvironmentOptions(browserArgs));
            await view.EnsureCoreWebView2Async(environment);
            var core = view.CoreWebView2;
            core.Settings.AreDevToolsEnabled = browserArgs.Length > 0;
            core.Settings.IsStatusBarEnabled = false; core.Settings.AreDefaultContextMenusEnabled = false;
            core.NewWindowRequested += delegate(object s, CoreWebView2NewWindowRequestedEventArgs e) { e.Handled = true; };
            core.NavigationStarting += delegate(object s, CoreWebView2NavigationStartingEventArgs e) {
                Uri target;
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out target) || (target.GetLeftPart(UriPartial.Authority) != initial.GetLeftPart(UriPartial.Authority) && target.Scheme != "about" && target.Scheme != "blob")) e.Cancel = true;
            };
            core.NavigationCompleted += delegate { FlushActivation(); };
            initialized = true; view.Source = initial;
        } catch (Exception error) { MessageBox.Show("تعذر تحميل نافذة البرنامج. تأكد من وجود Microsoft WebView2 Runtime.\n" + error.Message, "HWNiX", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }
    public void ActivateContent(string target) {
        Show(); if (WindowState == FormWindowState.Minimized) WindowState = FormWindowState.Normal; Activate(); BringToFront();
        if (String.IsNullOrEmpty(target)) return;
        pendingTarget = target; FlushActivation();
    }
    public async void FlushActivation() {
        if (activating || pendingTarget == null || !initialized || view.CoreWebView2 == null) return;
        activating = true;
        try {
            var target = pendingTarget;
            var result = await view.CoreWebView2.ExecuteScriptAsync("(function(){if(typeof window.hwnixActivate!=='function')return false;window.hwnixActivate(" + Program.Json.Serialize(target) + ");return true;})()");
            if (result == "true" && pendingTarget == target) pendingTarget = null;
        } catch { } finally { activating = false; }
    }
}

sealed class BridgeContext : ApplicationContext {
    readonly NotifyIcon tray;
    readonly Process child;
    readonly System.Windows.Forms.Timer timer;
    readonly bool background;
    readonly string key;
    readonly string[] initialFiles;
    readonly DateTime started = DateTime.UtcNow;
    readonly object logLock = new object();
    PrintWindow window;
    bool ready; bool closing; bool handlingActivation;
    string lastWake;

    public BridgeContext(bool isBackground, string[] files) {
        background = isBackground; initialFiles = files;
        var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        var node = Path.Combine(baseDirectory, "resources", "node.exe"); var entry = Path.Combine(baseDirectory, "resources", "bridge", "desktop.mjs");
        if (!File.Exists(node) || !File.Exists(entry)) throw new Exception("ملفات الأداة ناقصة. أعد تثبيت HWNiX Print Bridge.");
        var bytes = new byte[32]; using (var random = RandomNumberGenerator.Create()) random.GetBytes(bytes);
        key = BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
        var menu = new ContextMenuStrip(); menu.Items.Add("فتح البرنامج", null, delegate { if (ready) ShowWindow(null); });
        menu.Items.Add(new ToolStripSeparator()); menu.Items.Add("إنهاء الأداة", null, delegate { Quit(); });
        tray = new NotifyIcon { Icon = SystemIcons.Application, Text = "HWNiX Print Bridge", ContextMenuStrip = menu, Visible = true };
        tray.DoubleClick += delegate { if (ready) ShowWindow(null); };
        var info = new ProcessStartInfo(node, "\"" + entry + "\"") { WorkingDirectory = baseDirectory, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
        info.EnvironmentVariables["HWNIX_PRINT_DATA_DIR"] = Program.DataDirectory; info.EnvironmentVariables["HWNIX_PRINT_ADMIN_KEY"] = key;
        child = new Process { StartInfo = info }; child.OutputDataReceived += Log; child.ErrorDataReceived += Log;
        child.Start(); child.BeginOutputReadLine(); child.BeginErrorReadLine();
        timer = new System.Windows.Forms.Timer { Interval = 300 }; timer.Tick += CheckState; timer.Start();
    }
    void Log(object sender, DataReceivedEventArgs args) {
        if (String.IsNullOrWhiteSpace(args.Data)) return;
        lock (logLock) { try { if (File.Exists(Program.LogFile) && new FileInfo(Program.LogFile).Length > 256000) File.WriteAllText(Program.LogFile, ""); File.AppendAllText(Program.LogFile, DateTime.UtcNow.ToString("s") + " " + args.Data + Environment.NewLine); } catch { } }
    }
    void ShowWindow(string target) {
        if (window == null || window.IsDisposed) window = new PrintWindow(Program.SettingsUri());
        window.ActivateContent(target);
    }
    async void ImportFiles(string[] files) {
        if (files == null || files.Length == 0) return;
        try { await System.Threading.Tasks.Task.Run(delegate { Program.AdminPost("open-files", new { paths = files }); }); ShowWindow("files"); }
        catch (Exception error) { MessageBox.Show("تعذر فتح الملفات.\n" + error.Message, "HWNiX"); }
    }
    void CheckState(object sender, EventArgs args) {
        if (closing) return;
        if (child.HasExited) { closing = true; if (child.ExitCode != 0) MessageBox.Show("توقفت خدمة الطباعة أو أن المنفذ مستخدم.\nراجع:\n" + Program.LogFile, "HWNiX"); ExitThread(); return; }
        if (!ready && File.Exists(Program.UrlFile)) {
            try { if (Program.SettingsUri().Fragment == "#key=" + key) { ready = true; if (!background) ShowWindow(null); ImportFiles(initialFiles); } } catch { }
        }
        if (ready && !handlingActivation) {
            if (window != null && !window.IsDisposed) window.FlushActivation();
            handlingActivation = true;
            try {
                foreach (var file in Directory.GetFiles(Program.DataDirectory, "activation-*.json")) {
                    try { var activation = Program.Json.Deserialize<Activation>(File.ReadAllText(file)); File.Delete(file); ShowWindow(null); ImportFiles(activation.paths); } catch { }
                }
                var wake = Path.Combine(Program.DataDirectory, "window-request.json");
                if (File.Exists(wake)) { var request = Program.Json.Deserialize<WindowRequest>(File.ReadAllText(wake)); if (request.nonce != lastWake) { lastWake = request.nonce; ShowWindow(request.target); } }
            } catch { } finally { handlingActivation = false; }
        }
        if (!ready && (DateTime.UtcNow - started).TotalSeconds > 30) { timer.Stop(); MessageBox.Show("تشغيل الخدمة يستغرق وقتًا أطول من المتوقع. راجع سجل التشغيل أو أعد تشغيل الأداة.", "HWNiX"); }
    }
    void Quit() {
        if (Program.StopRunning() != 0) { MessageBox.Show("انتظر انتهاء الطباعة أو البحث ثم حاول الإغلاق مجددًا.", "HWNiX"); return; }
        closing = true; ExitThread();
    }
    protected override void ExitThreadCore() {
        timer.Stop(); timer.Dispose(); tray.Visible = false; tray.Dispose();
        if (window != null) { window.AllowClose = true; window.Close(); window.Dispose(); }
        child.Dispose(); base.ExitThreadCore();
    }
}
