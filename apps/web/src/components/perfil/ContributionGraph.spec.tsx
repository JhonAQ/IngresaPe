import { render, screen } from '@testing-library/react';
import { ContributionGraph, HeatmapDay } from './ContributionGraph';

function makeDay(date: string, intensity: number, extra?: Partial<HeatmapDay>): HeatmapDay {
  return { date, intensity, ...extra };
}

function localISODate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('ContributionGraph', () => {
  it('renderiza celdas para cada día del rango', () => {
    render(<ContributionGraph weeks={4} data={[]} />);
    const cells = screen.getAllByTestId('heatmap-day');
    expect(cells).toHaveLength(4 * 7);
  });

  it('muestra actividad real en las celdas correspondientes', () => {
    const today = localISODate();
    const data: HeatmapDay[] = [
      makeDay(today, 3, { questionsAnswered: 12, xpEarned: 60 }),
    ];

    render(<ContributionGraph weeks={4} data={data} />);
    const cells = screen.getAllByTestId('heatmap-day');
    const active = cells.filter((c) => Number(c.getAttribute('data-intensity')) > 0);

    expect(active.length).toBeGreaterThan(0);
    expect(active[0]?.getAttribute('data-intensity')).toBe('3');
  });

  it('rellena días sin actividad con intensidad 0', () => {
    const today = localISODate();
    const yesterday = localISODate(-1);
    const data: HeatmapDay[] = [
      makeDay(today, 2),
      makeDay(yesterday, 1),
    ];

    render(<ContributionGraph weeks={4} data={data} />);
    const cells = screen.getAllByTestId('heatmap-day');
    const intensities = cells.map((c) => Number(c.getAttribute('data-intensity')));

    expect(intensities).toContain(2);
    expect(intensities).toContain(1);
    expect(intensities.filter((i) => i === 0).length).toBeGreaterThan(0);
  });

  it('renderiza datos demo cuando no hay actividad', () => {
    render(<ContributionGraph weeks={4} />);
    const cells = screen.getAllByTestId('heatmap-day');
    const active = cells.filter((c) => Number(c.getAttribute('data-intensity')) > 0);

    expect(cells).toHaveLength(28);
    expect(active.length).toBeGreaterThan(0);
  });

  it('muestra etiquetas de días de la semana', () => {
    render(<ContributionGraph weeks={4} data={[]} />);
    expect(screen.getByText('Lun')).toBeTruthy();
    expect(screen.getByText('Dom')).toBeTruthy();
  });
});
