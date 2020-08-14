import React, { createRef, useState } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import { storage, firestore } from 'firebase/app'
import { Button, Typography, LinearProgress } from '@material-ui/core'

import imageUrl from '@/images/upload_file.svg'
import { ModalContainer } from '@common/components/ModalContainer'

export function ImageCreateModal({ open, onClose }) {
  const uploadRef = createRef()
  const [uploading, setUploading] = useState(false)
  const [uploadPercent, setPercent] = useState(false)

  const focusUpload = () => uploadRef.current.click()

  const handleUpload = e => {
    const file = e.target.files[0]
    const fileRef = storage().ref(`images/${file.name}`)
    const uploadTask = fileRef.put(file)

    uploadTask.on(
      'state_changed',
      snapshot => {
        setUploading(true)
        setPercent(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        )
      },
      err => {
        setPercent(0)
        setUploading(false)
        toast.error(`Upload audio failed: ${err.code}`)
      },
      () => {
        setUploading(false)
        setPercent(0)
        uploadTask.snapshot.ref.getDownloadURL().then(() => {
          firestore().collection('images').add({
            filename: file.name,
            createdAt: new Date(),
          })
        })
        onClose()
      }
    )
  }

  return (
    <ModalContainer open={open} onClose={onClose}>
      <Typography variant="h4">Upload image</Typography>

      <img
        className="py-4"
        style={{ margin: '0 30%', width: '40%', height: 'auto' }}
        src={imageUrl}
        alt="upload"
      />

      <div style={{ margin: '1em 5%', width: '90%' }}>
        {uploading && (
          <LinearProgress variant="determinate" value={uploadPercent} />
        )}
      </div>

      <Button variant="contained" color="primary" onClick={focusUpload}>
        Upload
      </Button>
      <input
        ref={uploadRef}
        type="file"
        accept=".png"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
    </ModalContainer>
  )
}

ImageCreateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
