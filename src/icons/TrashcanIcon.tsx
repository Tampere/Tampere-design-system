export function TrashcanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      {...props}
    >
      <path
        d="M16.4841 0V3.57615H23.5557V5.39128H22.0136L20.1913 24H4.91998L3.09769 5.39128H1.55566V3.57615H8.62754V0H16.4841ZM6.49657 22.1849H18.6148L20.2594 5.39128H4.85188L6.49657 22.1849ZM11.1504 8.2092V19.4947H9.4054V8.2092H11.1504ZM15.7059 8.2092V19.4947H13.961V8.2092H15.7059ZM10.3725 3.57615H14.7388V1.81549H10.3725V3.57615Z"
        fill={props.fill ?? '#3E3E45'}
      />
    </svg>
  );
}
