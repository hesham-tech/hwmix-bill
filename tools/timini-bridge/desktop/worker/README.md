# P2 Windows worker

HWNiX wrapper around the unmodified TiMini-Print v0.9 protocol/rendering sources (Apache-2.0).
Only `toprint_hprt_esc_zl1` image/PDF jobs with an explicit Bluetooth MAC are accepted.
Other models continue using the original bundled TiMini CLI.

The wrapper replaces the Windows Classic socket with native RFCOMM SPP service UUID
resolution, then keeps the same connection open for 12 seconds after a successful send.
There is no retry, extra paper feed, printer ACK or claim of mechanical completion.
The complete calibration image was physically verified with this route at 96 bytes/20 ms,
darkness 3. The previous CLI route could stop before the final image rows.

Upstream source: https://github.com/Dejniel/TiMini-Print/tree/v0.9
Source ZIP: https://codeload.github.com/Dejniel/TiMini-Print/zip/refs/tags/v0.9
ZIP SHA256: 0052ec1b49043d7a8f4b5df93db4e5010df782947660049fb6ddde13487afe65

Build with `build-worker.ps1 -PythonPath <isolated-python.exe> -TiMiniSourceDirectory <v0.9> -OutputDirectory <output>`.
Test with `python test_worker.py`. The customer needs neither Python nor build packages.
The isolated build uses Python 3.12.14, PyInstaller 6.22.3, hooks-contrib 2026.9,
Pillow 12.3.0, pypdfium2 5.14.0, bleak 3.0.2, crc8 0.2.1, pyserial 3.5,
platformdirs 4.12.3, packaging 26.3, winsdk 1.0.0b10 and the Windows winrt dependencies
installed by bleak. Exact distribution versions are recorded in the generated license text.

The installer includes `P2-Worker-LICENSES.txt` produced by the actual frozen worker.
Microsoft SPP endpoint documentation:
https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-connect
https://learn.microsoft.com/en-us/windows/win32/api/ws2bth/ns-ws2bth-sockaddr_bth
