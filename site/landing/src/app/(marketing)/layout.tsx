import Nav from '../../components/Nav';
import SiteFooter from '../../components/SiteFooter';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      {children}
      <SiteFooter />
    </>
  );
}
