"""HWNiX P2 worker: TiMini v0.9 protocol with native Windows SPP and drain wait."""
from pathlib import Path
import asyncio
import os
import sys

ROOT = Path(__file__).parent
os.environ['TIMINIPRINT_NO_UPDATE_CHECK'] = '1'
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):
        stream.reconfigure(encoding='utf-8', errors='replace')
MODEL = 'toprint_hprt_esc_zl1'
DRAIN_SECONDS = 12

async def print_with_drain(connected, args, print_input, sleep=asyncio.sleep):
    # No retry: a failed send may already have printed part of the label.
    await print_input(connected, args)
    if args.path:
        print('HWNIX_P2_DRAIN_WAIT=12', flush=True)
        await sleep(DRAIN_SECONDS)
        print('HWNIX_P2_DRAIN_FINISHED', flush=True)

def validate_print_args(args):
    import json
    import re
    if not re.fullmatch(r'[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5}', args.bluetooth or ''):
        raise ValueError('P2 worker requires the saved Bluetooth MAC address.')
    if args.serial or args.feed or args.retract or args.text or not args.path:
        raise ValueError('P2 worker accepts image/PDF print jobs only.')
    model = args.printer_model
    if args.printer_config:
        profile = json.loads(Path(args.printer_config).read_text(encoding='utf-8-sig'))
        model = profile.get('model_key')
    if model != MODEL:
        raise ValueError('Unsupported printer model for P2 worker.')

def main():
    from timiniprint.app import cli
    from timiniprint.transport.bluetooth.adapters.windows_adapter import _WindowsClassicAdapter
    from native_spp import connect_spp

    parsed = cli.parse_args()
    if not (parsed.list_models or parsed.licenses):
        validate_print_args(parsed)

    class NativeDiagnosticSocket:
        def __init__(self):
            self.socket = None
            self.timeout = 12
        def settimeout(self, timeout):
            self.timeout = timeout
            if self.socket is not None: self.socket.settimeout(timeout)
        def connect(self, target):
            self.socket = connect_spp(target[0], self.timeout)
            print('HWNIX_P2_SPP_CONNECTED', flush=True)
        def sendall(self, data): return self.socket.sendall(data)
        def recv(self, size): return self.socket.recv(size)
        def close(self):
            if self.socket is not None: self.socket.close()
            self.socket = None

    _WindowsClassicAdapter.create_socket = lambda *_args, **_kwargs: NativeDiagnosticSocket()
    original = cli.print_cli_input

    async def print_and_hold(connected, args):
        await print_with_drain(connected, args, original)

    cli.print_cli_input = print_and_hold
    return cli.main()

if __name__ == '__main__':
    raise SystemExit(main())
