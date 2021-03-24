import React, { forwardRef } from 'react'

export default forwardRef(
  (
    { avatarUrl, children, loading = 'eager', className = '', size = 12 },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`relative rounded-full flex-shrink-0 flex items-center justify-center bg-cover bg-center ${className}`}
        style={{
          width: `${size / 4}rem`,
          height: `${size / 4}rem`,
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined
        }}
      >
        {children}
      </div>
    )
  }
)