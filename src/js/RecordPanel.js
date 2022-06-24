/* eslint-disable class-methods-use-this */
export default class RecordPanel {
  constructor(container) {
    this.recordPanel = container;
    this.stopRecordListener = [];
    this.audioElement = null;
    this.textPanelEl = null;
    this.showErrorRecordMessage = [];
  }

  set textPanel(element) {
    if (element) {
      this.textPanelEl = element;
    } else {
      throw new Error('textPanel element error');
    }
  }

  /**
   * Обработчик по кнопке stop
   * @param {*} callback -
   */
  addStopRecordListener(callback) {
    this.stopRecordListener.push(callback);
  }

  addShowErrorRecordMessage(callback) {
    this.showErrorRecordMessage.push(callback);
  }

  /**
 * Запись голоса
 */
  async voiceRecording() {
    try {
      let stopButtonType = null; // Тип нажатой кнопки
      let timerId = null; // id интервала
      // Создаем элемент аудио
      const audio = this.createAudioElement();

      const stream = await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: false,
        },
      );
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.addEventListener('start', () => {
        // console.log('Запись началась');
        timerId = this.timer();
        this.show();
      });

      recorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        // console.log('Запись остановлена');
        if (stopButtonType === 'stop') {
          const blob = new Blob(chunks);
          audio.src = URL.createObjectURL(blob);
          this.audioElement = audio;
          this.stopRecordListener.forEach((o) => {
            o.call(null);
          });
        }
        clearInterval(timerId);
        this.hide();
      });

      const stopRecord = (event) => {
        if (event.target.tagName === 'BUTTON') {
          stopButtonType = event.target.dataset.record;
          recorder.stop();
          stream.getTracks().forEach((track) => track.stop());
          this.recordPanel.removeEventListener('click', stopRecord);
        }
      };

      this.recordPanel.addEventListener('click', stopRecord);
      recorder.start();
    } catch (err) {
      this.showErrorRecordMessage.forEach((o) => {
        o.call(null, err.message);
      });
    }
  }

  /**
   * Таймер
   * @returns id таймера
   */
  timer() {
    const el = this.recordPanel.querySelector('.sound-panel__time');
    el.textContent = '00:00';
    let minutes = 0;
    let seconds = 0;
    const intervalId = setInterval(() => {
      seconds += 1;
      if (seconds === 60) {
        minutes += 1;
        seconds = 0;
      }
      const min = (minutes < 10) ? `0${minutes}` : `${minutes}`;
      const sec = (seconds < 10) ? `0${seconds}` : `${seconds}`;
      el.textContent = `${min}:${sec}`;
    }, 1000);

    return intervalId;
  }

  /**
   * Создает html элемент audio
   * @returns -html элемент
   */
  createAudioElement() {
    const audio = document.createElement('audio');
    audio.classList.add('audio-player');
    audio.setAttribute('controls', true);
    return audio;
  }

  /**
   * Скрывает панель записи и показывает текстовую
   */
  hide() {
    this.recordPanel.classList.add('hidden');
    this.textPanelEl.classList.remove('hidden');
  }

  /**
   * Показывает панель записи и скрывает текстовую
   */
  show() {
    this.recordPanel.classList.remove('hidden');
    this.textPanelEl.classList.add('hidden');
  }
}
