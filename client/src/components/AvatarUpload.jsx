import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { uploadAvatar, removeAvatar } from '../app/slices/userSlice';
import { Camera, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AvatarUpload({ size = 100, onUploadComplete }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const result = await dispatch(uploadAvatar(formData)).unwrap();
      toast.success('Avatar updated successfully!');
      setPreview(null);
      if (onUploadComplete) onUploadComplete(result.avatar);
    } catch (error) {
      toast.error(error || 'Failed to upload avatar');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [dispatch, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleRemove = async () => {
    if (!confirm('Remove your profile picture?')) return;
    
    setUploading(true);
    try {
      await dispatch(removeAvatar()).unwrap();
      toast.success('Avatar removed');
      if (onUploadComplete) onUploadComplete(null);
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = preview || user?.avatar?.url;

  return (
    <div className="avatar-upload" style={{ position: 'relative', width: size, height: size }}>
      <div
        {...getRootProps()}
        className={`avatar-preview ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--gradient-1)',
          cursor: uploading ? 'default' : 'pointer',
          position: 'relative',
          border: '3px solid var(--border)',
          transition: 'all 0.3s ease'
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {!avatarUrl && !uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: size * 0.4,
            fontWeight: 800
          }}>
            {user?.name?.charAt(0)}
          </div>
        )}

        {uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Loader className="spin" size={size * 0.3} />
          </div>
        )}

        {!uploading && avatarUrl && (
          <div className="avatar-overlay">
            <Camera size={20} />
          </div>
        )}
      </div>

      {avatarUrl && !uploading && (
        <button
          onClick={handleRemove}
          className="btn btn-danger btn-sm"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        .avatar-preview:hover .avatar-overlay {
          opacity: 1;
        }
        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .avatar-preview.drag-active {
          border-color: var(--primary);
          transform: scale(1.05);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}