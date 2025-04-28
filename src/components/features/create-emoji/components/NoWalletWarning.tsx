type NoWalletWarningProps = {
  show: boolean;
};

export const NoWalletWarning = ({ show }: NoWalletWarningProps) => {
  if (!show) return null;
  return (
    <div className="rounded-md bg-yellow-50 p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            No wallet connected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>A connected wallet is required to create an NFT.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
