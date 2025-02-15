import React from 'react'
import clsx from 'clsx'

interface propType{
    placeholder:string,
    name:string,
    classes?:string
    type?:string
}
export const Input=({placeholder,name,type,classes}:propType)=> {
  return (
    <div>
        <input type={type} placeholder={placeholder} name={name} className={clsx("rounded p-2 focus:border-1 focus:ring-0 focus:outline-none border-2",classes)}  />
    </div>
  )
}
