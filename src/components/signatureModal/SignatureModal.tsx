import React, {useRef} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import SignatureCanvas, {
  SignatureViewRef,
} from 'react-native-signature-canvas';


interface SignatureModalProps {
  visible: boolean;
  doctorName: string;
  onClose: () => void;
  onSave: (signature: string) => void;
}

const SignatureModal = ({
  visible,
  doctorName,
  onClose,
  onSave,
}: SignatureModalProps) => {
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirmSignature = () => {
    signatureRef.current?.readSignature();
  };

  const handleEmptySignature = () => {
    Alert.alert(
      'Signature Required',
      'Please draw your signature first.',
    );
  };

  const handleSaveSignature = (signatureData: string) => {
    onSave(signatureData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.signatureOverlay}>
        <View style={styles.signatureModal}>

          <Text style={styles.signatureTitle}>
            Doctor's Signature
          </Text>

          <Text style={styles.signatureSubtitle}>
            {doctorName}
          </Text>

          <Text style={styles.signatureDescription}>
            Draw your signature in the area below.
          </Text>

          <View style={styles.signatureCanvasContainer}>
            {visible && (
              <SignatureCanvas
                ref={signatureRef}
                onOK={handleSaveSignature}
                onEmpty={handleEmptySignature}
                descriptionText=""
                backgroundColor="#FFFFFF"
                penColor="#153E6C"
                imageType="image/png"
                autoClear={false}
                webStyle={`
                  .m-signature-pad {
                    box-shadow: none;
                    border: none;
                  }
                  .m-signature-pad--body {
                    border: none;
                  }
                  .m-signature-pad--footer {
                    display: none;
                    margin: 0;
                  }
                  body, html {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                  }
                `}
              />
            )}
          </View>

          <View style={styles.signatureButtonRow}>
            <TouchableOpacity
              style={styles.signatureClearButton}
              onPress={handleClearSignature}>
              <Text style={styles.signatureClearText}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signatureSaveButton}
              onPress={handleConfirmSignature}>
              <Text style={styles.signatureSaveText}>
                Save Signature
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signatureCancelButton}
            onPress={onClose}>
            <Text style={styles.signatureCancelText}>
              Cancel
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default SignatureModal;
const styles = StyleSheet.create({
  signatureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  signatureModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  signatureTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#153E6C',
  },

  signatureSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 5,
  },

  signatureDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 15,
  },

  signatureCanvasContainer: {
    height: 220,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  signatureButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  signatureClearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  signatureClearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  signatureSaveButton: {
    flex: 2,
    backgroundColor: '#153E6C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  signatureSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  signatureCancelButton: {
    alignItems: 'center',
    marginTop: 16,
  },

  signatureCancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});