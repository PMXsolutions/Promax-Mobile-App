import React from "react";
import FormTableDisp from "@/components/shared/form-table-display";
import { formattedTime } from "@/helpers/shift-service";
import { ShiftReport } from "@/types/report";
import { ShiftRosterType } from "@/types/shift";

const ReportFormHeader = ({
  item,
  clientName,
}: {
  item: ShiftRosterType;
  clientName?: string;
}) => {
  return (
    <>
      <FormTableDisp
        label="Client’s Name"
        value={clientName || item?.clients}
      />
      <FormTableDisp
        label="Shift Start Time"
        value={formattedTime(item?.dateFrom, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Shift End Time"
        value={formattedTime(item?.dateTo, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Date"
        value={formattedTime(item?.dateFrom, "d MMMM, yyyy")}
      />
    </>
  );
};

export default ReportFormHeader;
