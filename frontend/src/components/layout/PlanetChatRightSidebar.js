import { FiSearch, FiUser, FiUserPlus } from 'react-icons/fi'
import { CgInfinity } from 'react-icons/cg'
import { BiHomeAlt } from 'react-icons/bi'
import NavLink from '../NavLink'
import Logo from '@/components/Logo'
import React, { useEffect, useState } from 'react'
import RSC from 'react-scrollbars-custom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCurrentUser } from '@/lib/queries/useCurrentUser'
import { useHeaderStore } from '@/lib/stores/useHeaderStore'
import { useRouter } from 'next/router'

const link =
  'cursor-pointer relative text-xs font-medium dark:hover:bg-gray-800 hover:bg-gray-200 px-6 h-10 flex items-center transition'

const label =
  'px-4 pt-6 pb-2 text-tertiary uppercase text-xs font-semibold tracking-widest'

export default function PlanetChatRightSidebar({ planet }) {
  const currentUser = useCurrentUser().data

  const { sidebar, setSidebar } = useHeaderStore()

  const { query, pathname } = useRouter()

  useEffect(() => setSidebar(false), [query, pathname])

  return (
    <>
      <AnimatePresence>
        {sidebar && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 0.75
            }}
            exit={{
              opacity: 0
            }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={() => setSidebar(false)}
            className={`z-30 fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-gray-900`}
          />
        )}
      </AnimatePresence>
      <nav
        className={`sidebar right-0 ${
          sidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-2">
          <div className={label}>USERS</div>
          {planet.users.map(user => (
            <div
              key={user.id}
              className="py-1.5 px-4 flex items-center rounded transition dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="relative w-9 h-9 dark:bg-gray-800 rounded-full inline-flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <div>
                    <FiUser className="w-5 h-5 text-tertiary" />
                  </div>
                )}
              </div>

              <div className="ml-3 font-medium text-tertiary">
                {user.username}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}
