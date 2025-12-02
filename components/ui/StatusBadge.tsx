import React from 'react';
import { NFeStatus } from '../../types';

export const StatusBadge: React.FC<{ status: NFeStatus }> = ({ status }) => {
  const styles = {
    [NFeStatus.AUTHORIZED]: "bg-green-100 text-green-800 border-green-200",
    [NFeStatus.CANCELED]: "bg-red-100 text-red-800 border-red-200",
    [NFeStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};