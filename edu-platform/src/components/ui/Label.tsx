import React from 'react'
export default function Label({ children, className, ...props }: any) { return <label className={className} {...props}>{children}</label> }
