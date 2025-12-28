import { render } from '@testing-library/react';

import IngresaPeUi from './ui';

describe('IngresaPeUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IngresaPeUi />);
    expect(baseElement).toBeTruthy();
  });
});
