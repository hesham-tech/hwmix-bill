import asyncio
import unittest
from argparse import Namespace
from p2_worker import validate_print_args, print_with_drain
from native_spp import connect_spp, SockAddrBth
import ctypes

class WorkerTests(unittest.TestCase):
    def test_validation_blocks_wrong_target_and_model_before_connect(self):
        args=Namespace(bluetooth='86:67:7A:50:30:83', serial=None,feed=False,retract=False,text=None,path='label.png',printer_model='toprint_hprt_esc_zl1',printer_config=None)
        validate_print_args(args)
        for field,value in [('bluetooth','friendly label'),('printer_model','other'),('serial','COM1'),('path',None)]:
            bad=Namespace(**vars(args));setattr(bad,field,value)
            with self.assertRaises(ValueError):validate_print_args(bad)
    def test_wait_only_after_success_and_same_connection(self):
        calls=[];connection=object()
        async def send(actual,args):self.assertIs(actual,connection);calls.append('send')
        async def wait(seconds):calls.append(seconds)
        asyncio.run(print_with_drain(connection,Namespace(path='label.png'),send,wait))
        self.assertEqual(calls,['send',12])
    def test_failed_send_does_not_wait_or_retry(self):
        calls=[]
        async def send(*args):calls.append('send');raise OSError('partial write')
        async def wait(*args):calls.append('wait')
        with self.assertRaises(OSError):asyncio.run(print_with_drain(object(),Namespace(path='label.png'),send,wait))
        self.assertEqual(calls,['send'])
    def test_native_address_validation_and_windows_packed_layout(self):
        self.assertEqual(ctypes.sizeof(SockAddrBth),30)
        with self.assertRaises(ValueError):connect_spp('invalid')
        with self.assertRaises(ValueError):connect_spp('86:67:7A:50:30:83',0)

if __name__=='__main__':unittest.main()
