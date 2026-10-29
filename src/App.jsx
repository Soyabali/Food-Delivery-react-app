import { Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAdmin } from '@/auth/RequireAdmin'
import { AppLayout } from '@/components/layout/AppLayout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { MediaLibraryPage } from '@/pages/MediaLibraryPage'
import { MenuItemsPage } from '@/pages/MenuItemsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { OffersPage } from '@/pages/OffersPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { RestaurantsPage } from '@/pages/RestaurantsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="media-library" element={<MediaLibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
