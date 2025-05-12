import { ExternalLink } from 'lucide-react';

type TransactionResult = 'success' | 'error';

interface TransactionResultProps {
  result: TransactionResult;
  title: string;
  message?: string;
  transactionHash?: string;
  explorerUrl?: string;
  explorerLabel?: string;
}

export function TransactionResult({
  result,
  title,
  message,
  transactionHash,
  explorerUrl,
  explorerLabel = 'View on Basescan',
}: TransactionResultProps) {
  const resultStyles = {
    success: {
      container: 'bg-green-50 border-green-100',
      title: 'text-green-800',
      icon: '🎉',
    },
    error: {
      container: 'bg-red-50 border-red-100',
      title: 'text-red-800',
      icon: '❌',
    },
  };

  const currentStyle = resultStyles[result];

  return (
    <div className={`border rounded-xl p-4 mb-4 ${currentStyle.container}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{currentStyle.icon}</span>
        <span className={`font-medium ${currentStyle.title}`}>{title}</span>
      </div>
      {message && <p className="text-sm text-gray-600 mb-2">{message}</p>}
      {result === 'success' && transactionHash && explorerUrl && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Transaction</span>
          <a
            href={explorerUrl}
            className="text-blue-500 flex items-center gap-1 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {explorerLabel}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
