import Modal from '../Modal';

const modal = new Modal();

test.each([
  ['51.50851, -0.12572'],
  ['51.50851,-0.12572'],
  ['[51.50851, -0.12572]'],
])('Функция валидации %s, true значения', (coords) => {
  const received = modal.validateData(coords);
  expect(received.status).toBeTruthy();
});

test.each([
  [''],
  ['23.45503'],
  ['51.50851 -0.12572'],
])('Функция валидации %s, false значения', (coords) => {
  const received = modal.validateData(coords);
  expect(received.status).toBeFalsy();
});
