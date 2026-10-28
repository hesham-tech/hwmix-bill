"""Windows RFCOMM connection resolved by SPP service UUID; generates no print commands."""
import ctypes
import select
import socket
import uuid
import re

class SockAddrBth(ctypes.Structure):
    _pack_ = 1
    _fields_ = [('family',ctypes.c_ushort),('address',ctypes.c_ulonglong),('service',ctypes.c_ubyte*16),('port',ctypes.c_ulong)]

def connect_spp(address, timeout=12):
    if not re.fullmatch(r'[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5}', address):
        raise ValueError('Invalid Bluetooth MAC address')
    if not 0 < timeout <= 120:
        raise ValueError('Invalid connection timeout')
    endpoint=SockAddrBth();endpoint.family=32;endpoint.address=int(address.replace(':',''),16)
    endpoint.service[:]=uuid.UUID('00001101-0000-1000-8000-00805f9b34fb').bytes_le
    endpoint.port=0
    sock=socket.socket(socket.AF_BLUETOOTH,socket.SOCK_STREAM,socket.BTPROTO_RFCOMM)
    sock.setblocking(False)
    ws=ctypes.WinDLL('ws2_32',use_last_error=True)
    ws.connect.argtypes=[ctypes.c_size_t,ctypes.c_void_p,ctypes.c_int];ws.connect.restype=ctypes.c_int
    try:
        result=ws.connect(sock.fileno(),ctypes.byref(endpoint),ctypes.sizeof(endpoint))
        if result:
            error=ws.WSAGetLastError()
            if error not in (10035,10036):raise OSError(error,'RFCOMM service connect failed')
            _,write,exception=select.select([], [sock], [sock],timeout)
            if not write and not exception:raise TimeoutError('RFCOMM service connection timeout')
            error=sock.getsockopt(socket.SOL_SOCKET,socket.SO_ERROR)
            if error:raise OSError(error,'RFCOMM service connect failed')
        sock.settimeout(timeout)
        return sock
    except:
        sock.close();raise
