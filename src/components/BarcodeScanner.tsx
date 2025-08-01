import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedValue, setScannedValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setHasPermission(true);
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      // Initialize the barcode reader
      readerRef.current = new BrowserMultiFormatReader();
      startScanning();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan barcodes",
        variant: "destructive"
      });
    }
  };

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            setScannedValue(scannedText);
            onScan(scannedText);
            toast({
              title: "Barcode Scanned Successfully",
              description: `Scanned: ${scannedText}`,
              variant: "default"
            });
            onClose();
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: "Scanner Error",
        description: "Failed to start barcode scanner",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasPermission === false ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                Camera access is required to scan barcodes
              </div>
              <Button onClick={initializeScanner} variant="outline">
                Request Camera Access
              </Button>
            </div>
          ) : hasPermission === null ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Requesting camera access...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-primary w-48 h-32 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Badge variant={isScanning ? "default" : "secondary"}>
                  {isScanning ? "Scanning..." : "Ready"}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Position the barcode or QR code within the frame
              </div>
              
              {scannedValue && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Last scanned:</span>
                    <span className="font-mono">{scannedValue}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;