'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { User, ChevronDown, ShoppingBag, Menu as MenuIcon, LogIn, Shield } from 'lucide-react'
import Link from 'next/link'

interface UserDropdownProps {
  user: {
    name?: string
    email?: string
    role: string
  }
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-slate-100 transition-colors text-sm">
        <div className="w-7 h-7 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-orange-600" />
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate">{user.name || user.email}</span>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">
          <p className="truncate">{user.name || user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orders" className="cursor-pointer">
            <ShoppingBag className="w-4 h-4 mr-2" />
            My Orders
          </Link>
        </DropdownMenuItem>
        {(user.role === 'staff' || user.role === 'admin') && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <MenuIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={handleLogout}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
