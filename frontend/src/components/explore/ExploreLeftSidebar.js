import { HiSortAscending, HiClock, HiCheckCircle } from 'react-icons/hi'
import { FaSortAlphaDown } from 'react-icons/fa'
import React, { forwardRef } from 'react'
import { useRouter } from 'next/router'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Scrollbar } from 'react-scrollbars-custom'
import Sidebar from '@/components/layout/Sidebar'
import { galaxies, galaxyIcon } from '@/lib/galaxies'
import NavLink from '@/components/NavLink'

export default forwardRef((props, ref) => {
  const { query, pathname } = useRouter()

  return (
    <Sidebar left ref={ref}>
      <div className="relative h-full w-full">
        <AutoSizer disableWidth>
          {({ height }) => (
            <Scrollbar style={{ width: '100%', height }}>
              <div className="text-xl font-semibold px-4 py-4 text-secondary">
                Explore
              </div>
              <div className="px-1 pb-6">
                <div className="space-y-0.5">
                  <NavLink
                    href={{ pathname, query: {} }}
                    className={`sidebar-item ${
                      (!query.sort && !query.galaxy) ||
                      query.sort === 'featured'
                        ? 'sidebar-item--active'
                        : ''
                    }`}
                  >
                    <HiCheckCircle className="w-5 h-5 mr-3" />
                    Featured
                  </NavLink>

                  <NavLink
                    href={{ pathname, query: { sort: 'top' } }}
                    className={`sidebar-item ${
                      query.sort === 'top' ? 'sidebar-item--active' : ''
                    }`}
                  >
                    <HiSortAscending className="w-5 h-5 mr-3" />
                    Most Popular
                  </NavLink>

                  <NavLink
                    href={{ pathname, query: { sort: 'new' } }}
                    className={`sidebar-item ${
                      query.sort === 'new' ? 'sidebar-item--active' : ''
                    }`}
                  >
                    <HiClock className="w-5 h-5 mr-3" />
                    Recently Created
                  </NavLink>

                  <NavLink
                    href={{ pathname, query: { sort: 'az' } }}
                    className={`sidebar-item ${
                      query.sort === 'az' ? 'sidebar-item--active' : ''
                    }`}
                  >
                    <FaSortAlphaDown className="w-5 h-5 mr-3" />
                    All
                  </NavLink>
                </div>

                <div className="sidebar-label">GALAXIES</div>

                {galaxies.map(galaxy => (
                  <NavLink
                    href={{ pathname, query: { galaxy } }}
                    key={galaxy}
                    className={`sidebar-item ${
                      query.galaxy === galaxy ? 'sidebar-item--active' : ''
                    }`}
                  >
                    {galaxyIcon(galaxy, 'h-5 w-5 mr-3')}
                    {galaxy}
                  </NavLink>
                ))}
              </div>
            </Scrollbar>
          )}
        </AutoSizer>
      </div>
    </Sidebar>
  )
})
