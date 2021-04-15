import React, { useState } from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { DropzoneDialog } from 'material-ui-dropzone';
const useStyles = makeStyles({
  muiVersion: {
    background: '#ddd',
    marginTop: '4em',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: '1em',
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
});
const MuiVersion = () => {
  const classes = useStyles();
  const [show, setShow] = useState(false);
  const handleFile = () => {};
  const handleDelete = () => {};
  const handleSubmit = () => {};
  return (
    <div className={classes.muiVersion}>
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
        dropzoneText={'drop it here'}
        getFileAddedMessage={() => 'file added!'}
        getFileRemovedMessage={() => 'file removed!'}
        onAlert={(alert) => console.log({ alert })}
        getFileLimitExceedMessage={() => 'file is too big'}
        getDropRejectMessage={() => 'invalid file type'}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default MuiVersion;
