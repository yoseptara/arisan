'use client';
import React from 'react';

function ClientDateLocaleString({ timestamp }: { timestamp: number }) {
  // Convert the timestamp to a Date object
  const date = new Date(timestamp);

  // Format the date as a string in the local timezone
  const localTimeString = date.toLocaleString();

  return <span>{localTimeString}</span>;
}

export default ClientDateLocaleString;
