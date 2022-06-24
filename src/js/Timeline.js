import Modal from './Modal';
import RecordPanel from './RecordPanel';
import Tooltip from './Tooltip';

export default class Timeline {
  constructor(container) {
    this.container = container;
    this.posts = container.querySelector('.timeline__posts');
    this.input = container.querySelector('#post-input');
  }

  /**
   * Инициализация
   */
  init() {
    const textPanel = this.container.querySelector('.timeline__input');
    this.modal = new Modal(this.container.querySelector('.popup'));
    this.recordPanel = new RecordPanel(this.container.querySelector('.sound-panel'));
    this.tooltip = new Tooltip(textPanel);
    this.recordPanel.textPanel = textPanel;
    this.modal.init();
    this.registerEvents();
  }

  /**
   * Регистрация обработчика событий
   */
  registerEvents() {
    // Кнопка записи
    const recordButton = this.container.querySelector('.timeline__button-record');
    recordButton.addEventListener('click', async () => {
      await this.recordPanel.voiceRecording();
    });
    // Ввод текста
    this.input.addEventListener('keypress', (event) => {
      // Если нажат Enter
      if (event.keyCode !== 13) return;
      if (event.target.value === '') {
        this.tooltip.showMessage(this.input, 'Заполните поле');
        return;
      }
      this.getPosition();
    });
    // Функции обработчики
    this.modal.addSaveButtonListener(this.saveModalData.bind(this));
    this.recordPanel.addStopRecordListener(this.getPosition.bind(this));
    this.recordPanel.addShowErrorRecordMessage(this.recordError.bind(this));
  }

  /**
   * Кнопка сохранить в модальном окне
   * @param {*} coords - координаты { latitude, longitude }
   */
  saveModalData(coords) {
    this.keyPressHandler(coords);
  }

  /**
   * Обработка после получения координат
   * @param {*} coords - { latitude, longitude }
   */
  keyPressHandler(coords) {
    const record = this.recordPanel.audioElement;
    if (!record) {
      const data = this.input.value.trim();
      this.input.value = ''; // Очистка поля
      const newPost = this.constructor.createPostEl(data, coords, 'text');
      this.posts.prepend(newPost);
    } else {
      const newPost = this.constructor.createPostEl(record, coords, 'audio');
      this.posts.prepend(newPost);
      this.recordPanel.audioElement = null;
    }
  }

  /**
   * Получает позицию
   */
  getPosition() {
    if (navigator.geolocation) {
      const success = (position) => {
        const { latitude, longitude } = position.coords;
        this.keyPressHandler({ latitude, longitude });
      };

      const error = (err) => {
        this.getPositionError(err);
      };

      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      this.modal.show();
    }
  }

  /**
   * Обработка ошибки при определении позиционирования
   * @param {*} error - ошибка
   */
  getPositionError() {
    this.modal.show();
  }

  /**
   * Создает элемент поста
   * @param {*} text - текст поста
   * @param {*} coords - координаты { latitude, longitude }
   * @returns - html элемент
   */
  static createPostEl(data, coords, type) {
    const post = document.createElement('div');
    post.classList.add('post');
    const time = document.createElement('time');
    time.classList.add('post__date');
    time.textContent = new Date(Date.now()).toLocaleString();

    const p = document.createElement('p');
    if (type === 'text') {
      p.classList.add('post__text');
      p.textContent = data;
    }

    const postCoords = document.createElement('p');
    postCoords.classList.add('post_coords');
    postCoords.textContent = `[${coords.latitude}, ${coords.longitude}]`;

    post.append(time);
    switch (type) {
      case 'text':
        post.append(p);
        break;
      case 'audio':
        post.append(data);
        break;
      default:
    }
    post.append(postCoords);
    return post;
  }

  /**
   * Сообщение об ошибке на кнопке записи
   * @param {*} message - текст сообщения
   */
  recordError(message) {
    const recordButton = this.container.querySelector('.timeline__button-record');
    this.tooltip.showMessage(recordButton, message);
  }
}
