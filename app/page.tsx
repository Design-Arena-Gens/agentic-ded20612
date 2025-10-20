'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addMinutes,
  compareAsc,
  differenceInMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  subDays
} from 'date-fns';
import clsx from 'clsx';
import { TaskForm } from '../components/task-form';
import {
  dayLabels,
  formatTaskTime,
  getDayKey,
  getReferenceDateForDay,
  parseTaskTime
} from '../lib/date-utils';
import { useRoutineStore } from '../lib/store';
import type { RoutineTask } from '../lib/types';

const priorityPalette: Record<string, string> = {
  low: 'tag tag--low',
  medium: 'tag tag--medium',
  high: 'tag tag--high'
};

function sortByTime(first: RoutineTask, second: RoutineTask) {
  return compareAsc(parseTaskTime(first, new Date()), parseTaskTime(second, new Date()));
}

export default function HomePage() {
  const tasks = useRoutineStore((state) => state.tasks);
  const toggleCompletion = useRoutineStore((state) => state.toggleCompletion);
  const isTaskCompleted = useRoutineStore((state) => state.isTaskCompleted);
  const deleteTask = useRoutineStore((state) => state.deleteTask);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);
  const todayIndex = now.getDay();
  const todayReference = useMemo(
    () => getReferenceDateForDay(todayIndex, now),
    [todayIndex, now]
  );

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.daysOfWeek.includes(todayIndex))
        .map((task) => ({ task, scheduled: parseTaskTime(task, todayReference) }))
        .sort((a, b) => compareAsc(a.scheduled, b.scheduled)),
    [tasks, todayIndex, todayReference]
  );

  const completedTodayCount = todayTasks.filter(({ task }) => isTaskCompleted(task.id, now)).length;

  const upcomingTasks = useMemo(() => {
    const windowStart = now;
    const windowEnd = addMinutes(now, 120);

    return todayTasks
      .filter(({ scheduled }) => isAfter(scheduled, windowStart) && isBefore(scheduled, windowEnd))
      .map(({ task, scheduled }) => ({
        task,
        scheduled,
        countdown: differenceInMinutes(scheduled, now)
      }));
  }, [now, todayTasks]);

  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const dayReference = useMemo(
    () => getReferenceDateForDay(selectedDay, now),
    [selectedDay, now]
  );

  const dayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.daysOfWeek.includes(selectedDay))
        .map((task) => ({ task, scheduled: parseTaskTime(task, dayReference) }))
        .sort((a, b) => compareAsc(a.scheduled, b.scheduled)),
    [tasks, selectedDay, dayReference]
  );

  const completions = useRoutineStore((state) => state.completions);
  const hasHistory = Object.keys(completions).length > 0;

  const mostRecentStreak = useMemo(() => {
    if (!hasHistory) {
      return 0;
    }

    let streak = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const day = subDays(now, offset);
      const key = getDayKey(day);
      const entries = completions[key] ?? [];
      if ((entries.length ?? 0) > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }, [completions, hasHistory, now]);

  const totalToday = todayTasks.length;
  const completionRatio = totalToday === 0 ? 0 : Math.round((completedTodayCount / totalToday) * 100);

  return (
    <main>
      <div className="page">
        <header className="page__header">
          <div>
            <span className="page__today">{format(now, 'EEEE, MMMM d')}</span>
            <h1>Daily Routine & Reminder Hub</h1>
            <p>
              Build sustainable habits across your week. Log repeating tasks, track your progress,
              and let gentle reminders keep you accountable.
            </p>
          </div>
          <div className="page__stats-card">
            <div>
              <strong>{completedTodayCount}</strong>
              <span>Tasks done today</span>
            </div>
            <div>
              <strong>{completionRatio}%</strong>
              <span>Completion rate</span>
            </div>
            <div>
              <strong>{mostRecentStreak}</strong>
              <span>Day streak</span>
            </div>
          </div>
        </header>

        <div className="layout">
          <div className="layout__left">
            <section className="card">
              <TaskForm />
            </section>

            <section className="card today">
              <header>
                <h2>Today&apos;s focus</h2>
                <span>
                  {completedTodayCount}/{totalToday} complete
                </span>
              </header>
              <div className="today__list">
                {todayTasks.length === 0 ? (
                  <p className="empty">No routines scheduled today. Add one to get started.</p>
                ) : (
                  todayTasks.map(({ task, scheduled }) => {
                    const isComplete = isTaskCompleted(task.id, now);
                    const isPast = isBefore(scheduled, now);
                    const minutesUntil = differenceInMinutes(scheduled, now);
                    const indicatorClass = clsx('pill', {
                      'pill--late': isPast && !isComplete,
                      'pill--complete': isComplete,
                      'pill--upcoming': minutesUntil >= 0 && minutesUntil <= 45
                    });

                    return (
                      <article key={task.id} className={clsx('task-card', { complete: isComplete })}>
                        <div>
                          <h3>{task.title}</h3>
                          <p>{task.description || 'No additional notes.'}</p>
                          <div className="task-meta">
                            <span className="time">{format(scheduled, 'h:mm a')}</span>
                            <span className={priorityPalette[task.priority]}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={indicatorClass}>
                              {isComplete
                                ? 'Done'
                                : isPast
                                  ? 'Missed'
                                  : minutesUntil === 0
                                    ? 'Due now'
                                    : `Starts in ${minutesUntil} min`}
                            </span>
                          </div>
                        </div>
                        <div className="task-actions">
                          <button type="button" onClick={() => toggleCompletion(task.id)}>
                            {isComplete ? 'Undo' : 'Mark done'}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="card upcoming">
              <header>
                <h2>Next reminders</h2>
                <span>{upcomingTasks.length} in the next 2 hours</span>
              </header>
              <div className="upcoming__list">
                {upcomingTasks.length === 0 ? (
                  <p className="empty">Nothing urgent approaching. You&apos;re on track.</p>
                ) : (
                  upcomingTasks.map(({ task, scheduled, countdown }) => (
                    <article key={task.id}>
                      <div>
                        <h3>{task.title}</h3>
                        <span>{format(scheduled, 'h:mm a')}</span>
                      </div>
                      <p>Due in {countdown} minutes — {task.description || 'Stay focused.'}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="layout__right">
            <section className="card weekly">
              <header>
                <h2>Weekly planner</h2>
                <span>Select a day to review its routine lineup.</span>
              </header>
              <nav className="weekly__tabs">
                {dayLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={clsx({ active: index === selectedDay })}
                    onClick={() => setSelectedDay(index)}
                  >
                    <span>{label.slice(0, 3)}</span>
                    <small>
                      {
                        tasks.filter((task) => task.daysOfWeek.includes(index)).length
                      }{' '}
                      tasks
                    </small>
                  </button>
                ))}
              </nav>

              <div className="weekly__list">
                {dayTasks.length === 0 ? (
                  <p className="empty">
                    No routines planned for {dayLabels[selectedDay]}. Add one to establish the habit.
                  </p>
                ) : (
                  dayTasks.map(({ task, scheduled }) => {
                    const completionKey = getDayKey(now);
                    const lastCompletion = completions[completionKey]?.includes(task.id);
                    const nextOccurrence = formatDistanceToNow(scheduled, { addSuffix: true });

                    return (
                      <article key={task.id} className="task-row">
                        <aside>
                          <span className="time">{formatTaskTime(task)}</span>
                          <span className={priorityPalette[task.priority]}>{task.priority}</span>
                        </aside>
                        <div>
                          <h3>{task.title}</h3>
                          <p>{task.description || 'No description yet.'}</p>
                          <div className="task-row__meta">
                            <span>{task.durationMinutes} min ritual</span>
                            <span>Next {nextOccurrence}</span>
                          </div>
                        </div>
                        <div className="task-row__actions">
                          <button type="button" onClick={() => toggleCompletion(task.id)}>
                            {lastCompletion ? 'Undo' : 'Done for today'}
                          </button>
                          <button type="button" onClick={() => deleteTask(task.id)} className="danger">
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
