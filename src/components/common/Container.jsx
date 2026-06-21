import React from 'react'

const Container = ({ children }) => {
  return (
    <div className="mx-auto max-w-[1300px] px-8 xl:px-12">
        {children}
    </div>
  )
}

export default Container