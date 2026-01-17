'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    sms: false,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const mockOrders = [
    { id: 'SW-12345', date: '2024-01-15', status: 'Delivered', total: 149.99, items: 2 },
    { id: 'SW-12344', date: '2024-01-10', status: 'Shipped', total: 89.99, items: 1 },
    { id: 'SW-12343', date: '2024-01-05', status: 'Processing', total: 234.99, items: 3 },
  ];

  const mockAddresses = [
    { id: '1', type: 'Home', name: 'John Doe', address: '123 Main St, Apt 4B', city: 'San Francisco', state: 'CA', zip: '94102', isDefault: true },
    { id: '2', type: 'Work', name: 'John Doe', address: '456 Business Ave, Suite 100', city: 'San Francisco', state: 'CA', zip: '94105', isDefault: false },
  ];

  const mockPaymentMethods = [
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'Mastercard', last4: '5555', expiry: '06/24', isDefault: false },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">My Account</li>
        </ol>
      </nav>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          Changes saved successfully!
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                JD
              </div>
              <div>
                <h2 className="font-semibold">John Doe</h2>
                <p className="text-sm text-gray-500">Member since 2024</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button className="w-full py-2 text-red-600 hover:text-red-700 text-sm font-medium">
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Order History</h2>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{order.id}</span>
                          <span className="text-gray-500 text-sm ml-4">{order.date}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{order.items} items</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="text-sm text-green-600 hover:text-green-700">View Details</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-sm text-green-600 hover:text-green-700">Track Order</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-sm text-green-600 hover:text-green-700">Buy Again</button>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/products" className="block mt-6 text-center text-green-600 hover:text-green-700">
                  Continue Shopping &rarr;
                </Link>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    Add New Address
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockAddresses.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 relative hover:border-green-300 transition-colors">
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Default
                        </span>
                      )}
                      <p className="font-medium mb-1">{addr.type}</p>
                      <p className="text-sm text-gray-600">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                      <div className="mt-3 flex gap-3">
                        <button className="text-sm text-green-600 hover:text-green-700">Edit</button>
                        <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Payment Methods</h2>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    Add Payment Method
                  </button>
                </div>
                <div className="space-y-4">
                  {mockPaymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center hover:border-green-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
                          {method.type}
                        </div>
                        <div>
                          <p className="font-medium">•••• {method.last4}</p>
                          <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                        </div>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button className="text-sm text-green-600 hover:text-green-700">Edit</button>
                        <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {[
                    { key: 'orderUpdates' as const, label: 'Order Updates', desc: 'Receive notifications about your order status' },
                    { key: 'promotions' as const, label: 'Promotions & Deals', desc: 'Get notified about sales and special offers' },
                    { key: 'newsletter' as const, label: 'Newsletter', desc: 'Weekly updates on new products and trends' },
                    { key: 'sms' as const, label: 'SMS Notifications', desc: 'Receive text messages for important updates' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:border-green-300 transition-colors">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(item.key)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                <div className="mb-8">
                  <h3 className="font-medium mb-4">Change Password</h3>
                  <form className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="border-t pt-8">
                  <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                    Enable 2FA
                  </button>
                </div>

                <div className="border-t pt-8 mt-8">
                  <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
