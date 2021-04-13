import React, { useState } from 'react';
import axios from 'axios';
import './Regular.scss';
import LoadingDots from 'imgs/loading-dots.gif';

const Regular = () => {
  const [file, setFile] = useState(null);
  const [inputContainsFile, setInputContainsFile] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState(false);

  const handleFile = (event) => {
    setFile(event.target.files[0]);
    setInputContainsFile(true);
  };

  const fileUploadHandler = () => {
    const fd = new FormData();
    fd.append('image', file, file.name);
    axios
      .post(`/image`, fd, {
        onUploadProgress: (progressEvent) => {
          console.log(
            'Upload progress: ',
            Math.round((progressEvent.loaded / progressEvent.total) * 100)
          );
        },
      })
      .then((res) => {
        setFile(null);
        setInputContainsFile(false);
        setCurrentlyUploading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleClick = (e) => {
    if (inputContainsFile) {
      setCurrentlyUploading(true);
      e.preventDefault();
      fileUploadHandler();
      setInputContainsFile(false);
    }
  };

  return (
    <div className='regular'>
      {currentlyUploading ? (
        <img
          src={LoadingDots}
          className='loadingdots'
          alt='upload in progress'
        />
      ) : (
        <>
          <input
            className='file-input'
            onChange={handleFile}
            type='file'
            name='file'
            id='file'
          />
          <label
            className={`inputlabel ${file && 'file-selected'}`}
            htmlFor='file'
            onClick={handleClick}
          >
            {file ? <>confirm</> : <>new profile pic</>}
          </label>
        </>
      )}
    </div>
  );
};

export default Regular;
