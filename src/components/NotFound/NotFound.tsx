import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ErrorPage, PRIMARY_ACTION } from '../ErrorPage';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="404"
      title="Page not found"
      description="We couldn't find that page. Try the homepage, or get in touch if you followed a link from us."
    >
      <Link to="/" className={PRIMARY_ACTION}>
        Go to homepage
      </Link>
      <Button variant="transparent" border="solid" fullWidth={false} onClick={() => navigate(-1)}>
        Go back
      </Button>
      <p className="w-full text-center text-[12px] text-slate-500 sm:order-last">
        Still stuck?{' '}
        <Link to="/contact" className="font-medium text-indigo-800 hover:underline">
          Contact us
        </Link>
      </p>
    </ErrorPage>
  );
};
