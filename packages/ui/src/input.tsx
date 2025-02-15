import React from 'react'

interface propType{
    placeholder:string,
    name:string,
    classes?:string
    type?:string
}
export const Input=({placeholder,name,type}:propType)=> {
  return (
    <div>
        <input type={type} placeholder={placeholder} name={name} className={"rounded p-2 focus:border-1 focus:ring-0 focus:outline-none"}  />
    </div>
  )
}
