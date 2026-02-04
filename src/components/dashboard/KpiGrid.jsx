import React from 'react';
import KpiCard from './KpiCard';

const KpiGrid = ({ cards }) => {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default KpiGrid;
