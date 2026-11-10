import type { Heatmap, HeatmapCell } from '../api';

export const heatmapScore = (cell: HeatmapCell) =>
  cell.average_score === null ? '' : String(Math.round(cell.average_score));

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const heatmapCsv = (heatmap: Heatmap, column: string) => {
  const header = [column, ...heatmap.skills.map((skill) => skill.skill_name)];
  const lines = heatmap.rows.map((row) => [
    row.label,
    ...heatmap.skills.map((skill) => {
      const cell = row.cells.find((item) => item.skill_id === skill.skill_id);
      return cell ? heatmapScore(cell) : '';
    }),
  ]);
  return `${[header, ...lines].map((line) => line.map(csvCell).join(',')).join('\n')}\n`;
};
