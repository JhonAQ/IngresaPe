import { getAuthToken, setAuthToken, removeAuthToken } from './auth';

describe('auth token storage', () => {
  beforeEach(() => {
    // Limpia localStorage antes de cada test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('debería guardar y recuperar el token', () => {
    const token = 'test-token-123';
    setAuthToken(token);

    expect(getAuthToken()).toBe(token);
  });

  it('debería devolver null si no hay token', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('debería eliminar el token', () => {
    setAuthToken('test-token');
    removeAuthToken();

    expect(getAuthToken()).toBeNull();
  });

  it('debería usar la clave auth_token', () => {
    setAuthToken('my-token');

    expect(window.localStorage.getItem('auth_token')).toBe('my-token');
  });
});
