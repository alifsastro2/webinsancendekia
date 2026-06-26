'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('useTabs must be used within Tabs')
  return ctx
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
}

function Tabs({ defaultValue = '', value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value ?? internalValue
  const handleChange = (v: string) => {
    setInternalValue(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue: handleChange }}>
      <div className={cn('', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-gray-100 rounded-xl mb-6', className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabs()
  const isActive = activeValue === value

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer',
        isActive
          ? 'bg-white shadow-sm text-gray-900'
          : 'text-gray-500 hover:text-gray-700',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: activeValue } = useTabs()
  if (activeValue !== value) return null

  return <div className={cn('', className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }