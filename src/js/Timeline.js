/* eslint-disable no-console */
import Modal from './Modal';

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
    this.modal = new Modal(this.container.querySelector('.popup'));
    this.modal.init();
    this.registerEvents();
  }

  /**
   * Регистрация обработчика событий
   */
  registerEvents() {
    this.input.addEventListener('keypress', (event) => {
      // Если нажат Enter
      if (event.keyCode !== 13 || event.target.value === '') return;
      this.getPosition();
    });
    this.modal.addSaveButtonListener(this.saveModalData.bind(this));
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
    const data = this.input.value.trim();
    this.input.value = ''; // Очистка поля
    const newPost = this.constructor.createPostEl(data, coords);
    this.posts.prepend(newPost);
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
    }
  }

  /**
   * Обработка ошибки при определении позиционирования
   * @param {*} error - ошибка
   */
  getPositionError(error) {
    this.modal.show();
    console.warn(error);
  }

  /**
   * Создает элемент поста
   * @param {*} text - текст поста
   * @param {*} coords - координаты { latitude, longitude }
   * @returns - html элемент
   */
  static createPostEl(text, coords) {
    const post = document.createElement('div');
    post.classList.add('post');
    const time = document.createElement('time');
    time.classList.add('post__date');
    time.textContent = new Date(Date.now()).toLocaleString();
    const p = document.createElement('p');
    p.classList.add('post__text');
    p.textContent = text;
    const postCoords = document.createElement('p');
    postCoords.classList.add('post_coords');
    postCoords.textContent = `[${coords.latitude}, ${coords.longitude}]`;
    post.append(time);
    post.append(p);
    post.append(postCoords);
    return post;
  }
}
