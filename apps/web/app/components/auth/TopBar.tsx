import Button from '../ui/Button';

const TopBar = () => {
  return (
    <div className="sticky top-0 z-50 flex">
      <Button>Sign-up</Button>
      <Button>Sign-in</Button>
    </div>
  );
};

export default TopBar;
