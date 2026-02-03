const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    SUCCESS: { label: 'Success', color: 'bg-green-100 text-green-800' },
    FAILURE: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    NO_SOLUTION: { label: 'No Solution', color: 'bg-orange-100 text-orange-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
