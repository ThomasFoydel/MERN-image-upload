import React, { useState } from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { DropzoneDialog } from 'material-ui-dropzone';
import axios from 'axios';

const useStyles = makeStyles({
  muiVersion: {
    background: 'linear-gradient(to bottom right, #ccc, #eee)',
    marginTop: '4em',
    textAlign: 'center',
    padding: '1em',
    borderRadius: '4px',
  },
  btn: {
    background: '#333',
    color: 'white',
    fontSize: '2.4rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    padding: '1em 2.4em',
    boxShadow: '0.2rem 0.2rem 0.2rem rgba(0, 0, 0, 0.466)',
    '&:hover': {
      background: '#111',
      transform: 'translateY(-0.25rem)',
      boxShadow: '0.45rem 0.45rem 0.45rem rgba(153, 153, 153, 0.651)',
    },
  },
  imageSection: {
    height: '20em',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
  },
  img: {
    width: '25vw',
    height: '25vw',
    minWidth: '10em',
    minHeight: '10em',
    maxWidth: '20em',
    maxHeight: '20em',
    objectFit: 'contain',
  },
  nopic: { color: 'black' },
  link: { color: 'black' },
});
const MuiVersion = () => {
  const classes = useStyles();
  const [show, setShow] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [currentlyUploading, setCurrentlyUploading] = useState(false);

  const handleFile = ([file]) => file && setImageFile(file);
  const handleDelete = () => setImageFile(null);
  const handleSubmit = ([file]) => {
    const fd = new FormData();
    fd.append('image', file, file.name);
    axios
      .post('/api/image/upload', fd, {
        onUploadProgress: (progressEvent) => {
          setProgress((progressEvent.loaded / progressEvent.total) * 100);
          console.log(
            'upload progress: ',
            Math.round((progressEvent.loaded / progressEvent.total) * 100)
          );
        },
      })
      .then(({ data }) => {
        setImageId(data);
        setImageFile(null);
        setCurrentlyUploading(false);
        setShow(false);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          const errMsg = err.response.data;
          if (errMsg) {
            console.log(errMsg);
            alert(errMsg);
          }
        } else if (err.response.status === 500) {
          console.log('db error');
          alert('db error');
        } else {
          console.log('other error');
        }
        setCurrentlyUploading(false);
        setShow(false);
      });
  };
  return (
    <div className={classes.muiVersion}>
      <div className={classes.imageSection}>
        {imageId ? (
          <>
            <img
              className={classes.img}
              src={`/api/image/${imageId}`}
              alt='material ui version preview'
            />
            <a
              className={classes.link}
              href={`/api/image/${imageId}`}
              target='_blank'
            >
              link
            </a>
          </>
        ) : (
          <p className={classes.nopic}>no mui version pic yet</p>
        )}
      </div>
      <Button className={classes.btn} onClick={() => setShow(true)}>
        mui version
      </Button>
      <DropzoneDialog
        open={show}
        onChange={handleFile}
        onClose={() => setShow(false)}
        onDelete={handleDelete}
        acceptedFiles={['image/jpeg', 'image/png']}
        maxFileSize={5000000}
        filesLimit={1}
        showFileNamesInPreview={false}
        showFileNames={false}
        dropzoneText={'Drop it here'}
        getFileAddedMessage={() => 'file added!'}
        getFileRemovedMessage={() => 'file removed!'}
        onAlert={(alert) => console.log({ alert })}
        getFileLimitExceedMessage={() => 'file is too big'}
        getDropRejectMessage={(file) => {
          if (file.size > 5000000) return 'file is too big';
          else return 'invalid file type';
        }}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default MuiVersion;
