# -*- coding: utf-8 -*-
Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "FileFunc.nsh"
Var TestInstall

!ifndef PAYLOAD
  !error "Define PAYLOAD as the packaged application folder"
!endif
!ifndef OUTPUT
  !error "Define OUTPUT as the release folder"
!endif

Name "HWNiX Print Bridge"
OutFile "${OUTPUT}\HWNiX-Print-Bridge-Setup-1.1.4.exe"
InstallDir "$LOCALAPPDATA\Programs\HWNiX Print Bridge"
InstallDirRegKey HKCU "Software\HWNiX\PrintBridge" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
VIProductVersion "1.1.4.0"
VIAddVersionKey "ProductName" "HWNiX Print Bridge"
VIAddVersionKey "FileDescription" "HWNiX Print Bridge Setup"
VIAddVersionKey "FileVersion" "1.1.4"
VIAddVersionKey "ProductVersion" "1.1.4"
VIAddVersionKey "LegalCopyright" "HWNiX. Third-party components retain their own licenses."

!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\HWNiXPrintBridge.exe"
!define MUI_FINISHPAGE_RUN_TEXT "فتح إعدادات الطباعة"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${PAYLOAD}\licenses\THIRD-PARTY-NOTICES.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

Function .onInit
  StrCpy $TestInstall "0"
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/TESTINSTALL" $R1
  ${IfNot} ${Errors}
    StrCpy $TestInstall "1"
    Goto ready
  ${EndIf}
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "هذه النسخة تحتاج Windows x64."
    Abort
  ${EndIf}
  IfFileExists "$INSTDIR\HWNiXPrintBridge.exe" 0 ready
  ExecWait '"$INSTDIR\HWNiXPrintBridge.exe" --stop' $0
  ${If} $0 != 0
    MessageBox MB_OK "انتظر انتهاء الطباعة وأغلق الأداة قبل تحديثها."
    Abort
  ${EndIf}
  Sleep 750
  ready:
FunctionEnd

Section "أداة الطباعة (مطلوبة)" Main
  SectionIn RO
  SetOutPath "$INSTDIR"
  File /r "${PAYLOAD}\*.*"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  ${If} $TestInstall == "1"
    FileOpen $0 "$INSTDIR\test-install.flag" w
    FileWrite $0 "HWNiX isolated installer verification"
    FileClose $0
    Goto main_complete
  ${EndIf}
  ; Per Microsoft guidance, detect the per-user and machine WebView2 Runtime.
  ReadRegStr $0 HKCU "Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
  ${If} $0 == ""
    ReadRegStr $0 HKLM "Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
  ${EndIf}
  ${If} $0 == ""
    ExecWait '"$INSTDIR\resources\MicrosoftEdgeWebView2Setup.exe" /silent /install' $1
    ${If} $1 != 0
      MessageBox MB_OK "تعذر تجهيز WebView2. اتصل بالإنترنت وأعد تشغيل المثبت."
      Abort
    ${EndIf}
  ${EndIf}
  CreateDirectory "$SMPROGRAMS\HWNiX Print Bridge"
  CreateShortcut "$SMPROGRAMS\HWNiX Print Bridge\إعداد الطباعة.lnk" "$INSTDIR\HWNiXPrintBridge.exe"
  CreateShortcut "$SMPROGRAMS\HWNiX Print Bridge\إزالة الأداة.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\HWNiX Print Bridge.lnk" "$INSTDIR\HWNiXPrintBridge.exe"
  ; Re-apply the selected startup preference on upgrades as well as fresh installs.
  Delete "$SMSTARTUP\HWNiX Print Bridge.lnk"
  WriteRegStr HKCU "Software\HWNiX\PrintBridge" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "DisplayName" "HWNiX Print Bridge"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "DisplayVersion" "1.1.4"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "Publisher" "HWNiX"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "DisplayIcon" "$INSTDIR\HWNiXPrintBridge.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge" "NoRepair" 1
  WriteRegStr HKCU "Software\Classes\hwnixprint" "" "URL:HWNiX Print"
  WriteRegStr HKCU "Software\Classes\hwnixprint" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\hwnixprint\shell\open\command" "" '$\"$INSTDIR\HWNiXPrintBridge.exe$\" $\"%1$\"'
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe" "FriendlyAppName" "HWNiX للطباعة"
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\shell\open\command" "" '$\"$INSTDIR\HWNiXPrintBridge.exe$\" --file $\"%1$\"'
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".pdf" ""
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".png" ""
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".jpg" ""
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".jpeg" ""
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".gif" ""
  WriteRegStr HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe\SupportedTypes" ".bmp" ""
  CreateShortcut "$SENDTO\HWNiX للطباعة.lnk" "$INSTDIR\HWNiXPrintBridge.exe" "--files"
  main_complete:
SectionEnd

Section "التشغيل تلقائيًا عند دخول Windows" AutoStart
  ${If} $TestInstall == "1"
    Goto autostart_complete
  ${EndIf}
  CreateShortcut "$SMSTARTUP\HWNiX Print Bridge.lnk" "$INSTDIR\HWNiXPrintBridge.exe" "--background"
  autostart_complete:
SectionEnd

Function un.onInit
  IfFileExists "$INSTDIR\test-install.flag" un_ready 0
  ExecWait '"$INSTDIR\HWNiXPrintBridge.exe" --stop' $0
  ${If} $0 != 0
    MessageBox MB_OK "انتظر انتهاء الطباعة وأغلق الأداة قبل إزالتها."
    Abort
  ${EndIf}
  Sleep 750
  un_ready:
FunctionEnd

Section "Uninstall"
  IfFileExists "$INSTDIR\test-install.flag" remove_files 0
  ; Only remove files under this application's installation directory.
  ; Per-user printer settings in LOCALAPPDATA\HWNiXPrintBridge are preserved.
  Delete "$SMSTARTUP\HWNiX Print Bridge.lnk"
  Delete "$DESKTOP\HWNiX Print Bridge.lnk"
  Delete "$SMPROGRAMS\HWNiX Print Bridge\إعداد الطباعة.lnk"
  Delete "$SMPROGRAMS\HWNiX Print Bridge\إزالة الأداة.lnk"
  RMDir "$SMPROGRAMS\HWNiX Print Bridge"
  Delete "$SENDTO\HWNiX للطباعة.lnk"
  DeleteRegKey HKCU "Software\Classes\hwnixprint"
  DeleteRegKey HKCU "Software\Classes\Applications\HWNiXPrintBridge.exe"
  DeleteRegKey HKCU "Software\HWNiX\PrintBridge"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HWNiXPrintBridge"
  remove_files:
  Delete "$INSTDIR\test-install.flag"
  Delete "$INSTDIR\Microsoft.Web.WebView2.Core.dll"
  Delete "$INSTDIR\Microsoft.Web.WebView2.WinForms.dll"
  Delete "$INSTDIR\WebView2Loader.dll"
  Delete "$INSTDIR\HWNiXPrintBridge.exe"
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\licenses"
  Delete "$INSTDIR\دليل الاستخدام.txt"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
SectionEnd
