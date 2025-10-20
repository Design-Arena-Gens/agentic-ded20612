'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { dayLabels } from '../lib/date-utils';
import { useRoutineStore } from '../lib/store';
import type { Priority } from '../lib/types';

interface TaskFormProps {
  onClose?: () => void;
}

const defaultDays = [1, 2, 3, 4, 5]; // Weekdays

export function TaskForm(props: TaskFormProps) {
  const { onClose } = props;
  const addTask = useRoutineStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>('medium');
  const [days, setDays] = useState<number[]>(defaultDays);

  const isWeekdayPattern = useMemo(
    () => days.length === 5 && days.every((day) => day >= 1 && day <= 5),
    [days]
  );

  const isEverydayPattern = useMemo(() => days.length === 7, [days]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      time,
      durationMinutes: duration,
      priority,
      daysOfWeek: days
    });

    setTitle('');
    setDescription('');
    setTime('08:00');
    setDuration(30);
    setPriority('medium');
    setDays(defaultDays);
    onClose?.();
  };

  const toggleDay = (dayIndex: number) => {
    setDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((day) => day !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const setPattern = (pattern: 'weekday' | 'everyday' | 'custom') => {
    if (pattern === 'weekday') {
      setDays(defaultDays);
    } else if (pattern === 'everyday') {
      setDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="form"
    >
      <header className="form__header">
        <div>
          <h2>Plan a new routine</h2>
          <p>Create a repeating task and reminders will keep you on track.</p>
        </div>
        <div className="form__preset-buttons">
          <button
            type="button"
            className={isWeekdayPattern ? 'active' : ''}
            onClick={() => setPattern('weekday')}
          >
            Weekdays
          </button>
          <button
            type="button"
            className={isEverydayPattern ? 'active' : ''}
            onClick={() => setPattern('everyday')}
          >
            Every day
          </button>
        </div>
      </header>

      <label className="form__label">
        <span>Title</span>
        <input
          required
          maxLength={60}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Morning stretch, hydrate, journal..."
        />
      </label>

      <label className="form__label">
        <span>Reminder time</span>
        <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
      </label>

      <label className="form__label">
        <span>Duration (minutes)</span>
        <input
          type="number"
          min={5}
          max={240}
          step={5}
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        />
      </label>

      <label className="form__label">
        <span>Priority</span>
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          <option value="low">Low — nice to do</option>
          <option value="medium">Medium — important</option>
          <option value="high">High — critical</option>
        </select>
      </label>

      <fieldset className="form__days">
        <legend>Repeats on</legend>
        <div className="form__days-grid">
          {dayLabels.map((day, index) => (
            <label key={day} className={days.includes(index) ? 'active' : ''}>
              <input
                type="checkbox"
                checked={days.includes(index)}
                onChange={() => toggleDay(index)}
              />
              {day.slice(0, 3)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="form__label">
        <span>Notes</span>
        <textarea
          rows={3}
          maxLength={220}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Why is this routine meaningful? What should you remember?"
        />
      </label>

      <footer className="form__footer">
        <button type="submit">Add to routine</button>
      </footer>
    </motion.form>
  );
}
