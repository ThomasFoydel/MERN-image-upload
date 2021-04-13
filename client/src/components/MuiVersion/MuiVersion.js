import React, { useState } from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { DropzoneDialog } from 'material-ui-dropzone';
const useStyles = makeStyles({});
const MuiVersion = () => {
  const classes = useStyles();
  const [show, setShow] = useState(false);
  const handleFile = () => {};
  const handleDelete = () => {};
  const handleSubmit = () => {};
  return (
    <div>
      <Button className={classes.btn} onClick={() => setShow(true)}>
        mui version new pic
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
        dropzoneText={'drop it here :) '}
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
