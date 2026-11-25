import { WeekdaysPipe } from './weekdays.pipe';

describe('WeekdaysPipe', () => {
  const pipe = new WeekdaysPipe();

  // CA13: os dias por extenso curto, em ordem, com vírgula e "e" antes do último.
  it.each([
    [[1, 3, 5], 'seg, qua e sex'],
    [[5, 1, 3], 'seg, qua e sex'],
    [[2, 4], 'ter e qui'],
    [[6], 'sáb'],
    [[1, 2, 3, 4, 5], 'seg, ter, qua, qui e sex'],
    [[7, 6], 'sáb e dom'],
  ])('escreve os dias %j como "%s"', (weekdays, text) => {
    expect(pipe.transform(weekdays)).toBe(text);
  });
});
