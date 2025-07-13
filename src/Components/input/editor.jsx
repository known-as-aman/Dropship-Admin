import React from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
const HTMLEditor = ({setValue,setContents=null}) => {

  const onChangeHandler = (htmlText) =>{
    setValue(htmlText);
  }

  return (
    <div>
      <SunEditor onChange={onChangeHandler} setContents={setContents} />
    </div>
  );
};
export default HTMLEditor;
