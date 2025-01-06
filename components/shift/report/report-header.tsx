import React from "react";
import FormTableDisp from "@/components/shared/form-table-display";
import { formattedTime } from "@/helpers/shift-service";
import { ShiftReport } from "@/types/report";

const ReportFormHeader = ({ item }: { item: ShiftReport }) => {
  return (
    <>
      <FormTableDisp label="Client’s Name" value={item?.shiftRoster.clients} />
      <FormTableDisp
        label="Shift Start Time"
        value={formattedTime(item?.shiftRoster.dateFrom, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Shift End Time"
        value={formattedTime(item?.shiftRoster.dateTo, "d MMMM, yyyy h:mm a")}
      />
      <FormTableDisp
        label="Date"
        value={formattedTime(item?.dateCreated, "d MMMM, yyyy")}
      />
    </>
  );
};

export default ReportFormHeader;
