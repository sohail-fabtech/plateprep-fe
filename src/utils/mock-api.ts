/* eslint-disable */
import MockAdapter from 'axios-mock-adapter';
import axiosInstance from './axios';

// Create a mock adapter for axios
const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

// Mock user data
const mockUser = {
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  displayName: 'Jaydon Frankie',
  email: 'demo@minimals.cc',
  password: 'demo1234',
  photoURL: '/assets/images/avatars/avatar_default.jpg',
  phoneNumber: '+40 777666555',
  country: 'United States',
  address: '90210 Broadway Blvd',
  state: 'California',
  city: 'San Francisco',
  zipCode: '94116',
  about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.',
  role: 'admin',
  isPublic: true,
};

// Generate access token
const generateToken = () =>
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(mockUser))}.${Date.now()}`;

// Login endpoint
mock.onPost('/api/account/login').reply((config) => {
  const { email, password } = JSON.parse(config.data);

  if (email === 'demo@minimals.cc' && password === 'demo1234') {
    const accessToken = generateToken();
    return [
      200,
      {
        accessToken,
        user: mockUser,
      },
    ];
  }

  return [400, { message: 'Invalid email or password' }];
});

// Register endpoint
mock.onPost('/api/account/register').reply((config) => {
  const { email, firstName, lastName } = JSON.parse(config.data);

  const newUser = {
    ...mockUser,
    id: `${Date.now()}`,
    displayName: `${firstName} ${lastName}`,
    email,
  };

  const accessToken = generateToken();

  return [
    200,
    {
      accessToken,
      user: newUser,
    },
  ];
});

// Get user account endpoint
mock.onGet('/api/account/my-account').reply((config) => {
  const { Authorization } = config.headers || {};

  if (!Authorization) {
    return [401, { message: 'Unauthorized' }];
  }

  return [
    200,
    {
      user: mockUser,
    },
  ];
});

// Pass through for all other requests
mock.onAny().passThrough();

export default mock;

