'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { circleClubs, mockReports, useCircleStore } from '@/store/circle-store';
import type { ReportItem } from '@/types';
import { Header, Screen } from './shared';

const statusLabel: Record<ReportItem['status'], string> = {
  pending: 'На проверке',
  approved: 'Одобрено',
  rejected: 'Отклонено'
};

const statusClass: Record<ReportItem['status'], string> = {
  pending: 'bg-amber-300/10 text-amber-200 border-amber-300/25',
  approved: 'bg-emerald-300/10 text-emerald-200 border-emerald-300/25',
  rejected: 'bg-rose-300/10 text-rose-200 border-rose-300/25'
};

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const reports = useCircleStore((state) => state.reports);
  const moderateReport = useCircleStore((state) => state.moderateReport);
  const reportList = [...reports, ...mockReports.filter((mockReport) => !reports.some((report) => report.id === mockReport.id))];

  return (
    <Screen>
      <Header title="Панель директора" onBack={onBack} />
      <Card>
        <p className="text-sm text-muted-foreground">Модерация отчетов пользователей перед начислением баллов и обновлением серии.</p>
      </Card>
      <div className="space-y-3">
        {reportList.length > 0 ? reportList.map((report) => {
          const club = circleClubs.find((item) => item.id === report.clubId);

          return (
            <Card key={report.id} className="space-y-3">
              <div className="flex gap-3">
                <Image src={report.image} alt="Скриншот отчета" width={76} height={76} unoptimized className="h-[76px] w-[76px] rounded-2xl bg-white/10 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-black">{report.userName}</p>
                  <p className="text-sm text-muted-foreground">{club?.title ?? 'Клуб не найден'}</p>
                  <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass[report.status]}`}>{statusLabel[report.status]}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{report.note}</p>
              {report.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => moderateReport(report.id, 'approved')}>Одобрить</Button>
                  <Button className="bg-white/10 text-white hover:bg-white/15" onClick={() => moderateReport(report.id, 'rejected')}>Отклонить</Button>
                </div>
              )}
            </Card>
          );
        }) : <Card><p className="text-sm text-muted-foreground">Пока нет отчетов на модерацию.</p></Card>}
      </div>
    </Screen>
  );
}
