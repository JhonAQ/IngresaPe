import { render, screen } from '@testing-library/react';
import { RatingChart } from './RatingChart';

describe('RatingChart', () => {
  it('muestra el estado vacío cuando no hay historial', () => {
    render(<RatingChart history={[]} dates={[]} />);
    expect(screen.getByText(/Aún no hay historial de simulacros/i)).toBeTruthy();
  });

  it('renderiza un punto por cada entrada del historial', () => {
    render(
      <RatingChart
        history={[15, 42, 68, 91]}
        dates={['S1', 'S2', 'S3', 'S4']}
        currentMax={91}
      />
    );

    expect(screen.getAllByTestId('rating-point')).toHaveLength(4);
  });

  it('renderiza un punto aunque el historial tenga una sola entrada', () => {
    render(<RatingChart history={[55]} dates={['S1']} currentMax={55} />);
    expect(screen.getAllByTestId('rating-point')).toHaveLength(1);
  });

  it('muestra las etiquetas del eje X', () => {
    render(
      <RatingChart
        history={[20, 50, 80]}
        dates={['S1', 'S2', 'S3']}
        currentMax={80}
      />
    );

    expect(screen.getByText('S1')).toBeTruthy();
    expect(screen.getByText('S2')).toBeTruthy();
    expect(screen.getByText('S3')).toBeTruthy();
  });
});
