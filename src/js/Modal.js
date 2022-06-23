/* eslint-disable class-methods-use-this */
import { createPopper } from '@popperjs/core';

export default class Modal {
  constructor(container) {
    this.modal = container;
    this.saveButtonListener = [];
  }

  /**
   * Инициализация
   */
  init() {
    this.input = this.modal.querySelector('.popup__input_field');
    this.registerEvents();
  }

  /**
   * Регистрация обработчика событий
   */
  registerEvents() {
    const saveBtn = this.modal.querySelector('.popup__button_save');
    const cancelBtn = this.modal.querySelector('.popup__button_cancel');
    saveBtn.addEventListener('click', () => {
      this.saveHandler(this.input.value);
    });
    cancelBtn.addEventListener('click', () => {
      this.cancelHandler();
    });
    this.input.addEventListener('keypress', (event) => {
      if (event.keyCode !== 13) return;
      this.saveHandler(this.input.value);
    });
  }

  /**
 * Действие по кнопке сохранить
 */
  saveHandler(data) {
    const result = this.validateData(data);

    if (result.status) {
      this.saveButtonListener.forEach((o) => {
        o.call(null, result.message);
      });
      this.hide();
    } else {
      this.showError(this.input, result.message);
    }
  }

  /**
   * Действие по кнопке отмена
   */
  cancelHandler() {
    this.hide();
  }

  /**
   * Валидация введенных координат
   * @returns - false или объект coords
   */
  validateData(data) {
    if (data === '') {
      return { status: false, message: 'Заполните поле' };
    }

    let newData = data.split(',');

    if (newData.length !== 2) {
      return { status: false, message: 'Не верные данные' };
    }

    newData = newData.map((item) => item.replace(/\[|\]/g, '').trim());
    const coords = { latitude: newData[0], longitude: newData[1] };
    return { status: true, message: coords };
  }

  /**
   * Действие по кнопке Сохранить
   * @param {*} callback - callback
   */
  addSaveButtonListener(callback) {
    this.saveButtonListener.push(callback);
  }

  /**
   * Скрывает окно
   */
  hide() {
    this.modal.classList.add('hidden');
    this.reset();
  }

  /**
   * Показывает окно
   */
  show() {
    this.modal.classList.remove('hidden');
    this.input.focus();
  }

  /**
   * Очистка поля
   */
  reset() {
    this.input.value = '';
  }

  /**
   * Показывает сообщение с ошибкой
   * @param {*} element - Элемент у которого показать подсказку
   * @param {*} text - Текст сообщения
   */
  showError(element, text) {
    const errorTooltip = this.modal.querySelector('#error-tooltip');
    const popperInstance = createPopper(element, errorTooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 6],
          },
        },
      ],
    });
    errorTooltip.querySelector('#error-message').textContent = text;
    errorTooltip.setAttribute('data-show', '');
    popperInstance.update();
    // element.focus();
    setTimeout(() => {
      errorTooltip.removeAttribute('data-show');
    }, 2500);
  }
}
