import React from 'react';
import { render } from '@testing-library/react';
import Page from '../src/app/page';

describe('Page', () => {
  it('redirects to /dashboard', () => {
    expect(() => render(<Page />)).toThrow('NEXT_REDIRECT');
  });
});
