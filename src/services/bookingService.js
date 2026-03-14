import api from './api'

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByDriver: (driverId) => api.get(`/bookings/driver/${driverId}`),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'),
  updateStatus: (bookingId, status) => api.post('/bookings/status', { bookingId, status }),
  acceptBooking: (bookingId, driverId) => api.post('/driver/accept', { bookingId, driverId }),
  updateDriverStatus: (driverId, status) => api.post(`/driver/status?driverId=${driverId}&status=${status}`),
  updateLocation: (driverId, lat, lng) => api.post('/location/update', { driverId, lat, lng }),
  getDriverLocation: (driverId) => api.get(`/location/driver/${driverId}`),
}
