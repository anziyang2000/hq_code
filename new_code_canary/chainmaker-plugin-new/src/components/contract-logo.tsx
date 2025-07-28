import React, { useEffect, useRef } from "react"



//contractIcon
const getRandom = (start, end, precision)=>{
    const num = Math.random()*end + start
   return  Math.round(num* Math.pow(10,precision)) / Math.pow(10,precision)
  }
export const createIconToken = () => {
    const num = Math.random()*3+2
    const result = [];
    for (let i = 0; i<num; i++){
      result.push(getRandom(30,255,0)+","+getRandom(30,255,0)+","+getRandom(30,255,0)+","+ getRandom(0.2,0.5,2))
    }
    return result.join("-")
  }
  export const renderTokenIcon = (parent,tokenIcon, size) => {
    if(!tokenIcon) {
      tokenIcon = createIconToken()
    }
    const arr = tokenIcon.split("-")
    arr.forEach((color, index)=>{
      const ele = document.createElement("div")
      ele.className = "token-icon-per"
      ele.style.width=size+"px"
      ele.style.height=size/2+"px"
      ele.style["background-color"] = `rgba(${color})`
      ele.style.transform=`rotate(${index * 360/arr.length}deg)`
      parent.appendChild(ele)
    })
   return tokenIcon
  }

export function ContractLogo({logoToken,size}:{logoToken:string,size:number}){
    const icon = useRef(null);
    // renderTokenIcon(token)
    useEffect(() => {
      renderTokenIcon(icon.current, logoToken, size);
    },[logoToken])
    return <div 
        className="contract-logo"
        ref={icon} 
        style={{width:`${size}px`, height:`${size}px`}}>
    </div>
  }